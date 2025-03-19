from typing import Any, Dict, List, Optional, Tuple, Union
from decimal import Decimal
from datetime import date, datetime, time, timedelta
import pandas as pd

def execute_query(query: str, params: Optional[Any] = None) -> List[Dict[str, Any]]: ... 