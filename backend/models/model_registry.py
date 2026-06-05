from config import config

class ModelRegistry:
    """
    Registry for managing AI models and their configurations.
    """
    
    @staticmethod
    def get_model_config(model_name: str) -> dict:
        """
        Get configuration for a specific model.
        
        Args:
            model_name (str): Name of the model to get configuration for
            
        Returns:
            dict: Model configuration
            
        Raises:
            ValueError: If model_name is not found in the registry
        """
        if model_name not in config.MODEL_CONFIGS:
            raise ValueError(f"Model '{model_name}' is not registered in the model registry.")
            
        return config.MODEL_CONFIGS[model_name]
    
    @staticmethod
    def list_available_models() -> list:
        """
        Get a list of all available model names.
        
        Returns:
            list: List of available model names
        """
        return list(config.MODEL_CONFIGS.keys())
    
    @classmethod
    def is_valid_model(cls, model_name: str) -> bool:
        """
        Check if a model name is valid (exists in the registry).
        
        Args:
            model_name (str): Name of the model to check
            
        Returns:
            bool: True if the model exists, False otherwise
        """
        return model_name in config.MODEL_CONFIGS
