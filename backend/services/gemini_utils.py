import random
import time

RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
RETRYABLE_MESSAGE_MARKERS = (
    "unavailable",
    "high demand",
    "resource exhausted",
    "rate limit",
    "temporarily unavailable",
    "service unavailable",
)


def _extract_status_code(exc):
    for attr in ("status", "code"):
        value = getattr(exc, attr, None)
        if isinstance(value, int):
            return value
        if isinstance(value, str) and value.isdigit():
            return int(value)

    response = getattr(exc, "response", None)
    if response is not None:
        for attr in ("status_code", "status"):
            value = getattr(response, attr, None)
            if isinstance(value, int):
                return value
            if isinstance(value, str) and value.isdigit():
                return int(value)

    return None


def _is_retryable(exc):
    status_code = _extract_status_code(exc)
    if status_code in RETRYABLE_STATUS_CODES:
        return True

    message = str(exc).lower()
    return any(marker in message for marker in RETRYABLE_MESSAGE_MARKERS)


def generate_content_with_retry(
    client,
    model_id,
    contents,
    *,
    fallback_model_ids=None,
    attempts=4,
    initial_delay_seconds=1.5,
    max_delay_seconds=8.0,
    operation_name="Gemini request",
):
    """
    Calls Gemini with retry/backoff for transient overloads.
    """
    if not client:
        raise RuntimeError("Gemini client unavailable")

    last_error = None
    model_ids = []

    if isinstance(model_id, (list, tuple)):
        model_ids.extend([model for model in model_id if model])
    elif model_id:
        model_ids.append(model_id)

    if fallback_model_ids:
        model_ids.extend([model for model in fallback_model_ids if model])

    deduped_model_ids = []
    seen_models = set()
    for model in model_ids:
        if model not in seen_models:
            seen_models.add(model)
            deduped_model_ids.append(model)

    if not deduped_model_ids:
        raise RuntimeError("No Gemini model ids configured")

    for model_index, current_model in enumerate(deduped_model_ids, start=1):
        for attempt in range(1, attempts + 1):
            try:
                return client.models.generate_content(model=current_model, contents=contents)
            except Exception as exc:
                last_error = exc
                retryable = _is_retryable(exc)
                status_code = _extract_status_code(exc)

                if not retryable:
                    raise

                if attempt >= attempts:
                    if model_index < len(deduped_model_ids):
                        print(
                            f"{operation_name} exhausted retries for model {current_model} "
                            f"(status={status_code if status_code is not None else 'unknown'}). "
                            f"Trying fallback model {deduped_model_ids[model_index]}."
                        )
                        break
                    raise

                delay = min(max_delay_seconds, initial_delay_seconds * (2 ** (attempt - 1)))
                delay += random.uniform(0, min(0.5, delay * 0.2))
                status_label = status_code if status_code is not None else "unknown"
                print(
                    f"{operation_name} temporarily unavailable on {current_model} "
                    f"(attempt {attempt}/{attempts}, status={status_label}). "
                    f"Retrying in {delay:.1f}s."
                )
                time.sleep(delay)

    raise last_error
