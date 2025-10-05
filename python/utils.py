ENTITY_MAPPING = {
    "UN-HABITAT": "UN-Habitat",
    "UNHABITAT": "UN-Habitat",
    "UNWOMEN": "UN-Women",
    "UNWTO": "UN Tourism",
    "OHRLLS": "UN-OHRLLS",
    "POE-CAR": "PoE-CAR",
    "POE-HAITI": "PoE-Haiti",
    "POE-LIBYA": "PoE-Libya",
    "POE-SUDAN": "PoE-Sudan",
    "POE-YEMEN": "PoE-Yemen",
    "POS-SSUDAN": "PoE-S.Sudan",
    "SRSG-CAAC": "OSRSG-CAAC",
    "SRSG-SVC": "OSRSG-SVC",
    "SRSG-VAC": "OSRSG-VAC",
    "OSESG-MYAN": "OSESG-Myanmar",
    "SESG-MYAN": "OSESG-Myanmar",
    "SESG-HAFRICA": "OSESG-Horn",
    "SESG-YEMEN": "OSESG-Yemen",
    "SC-RES1559": "OSESG-SCRES1559",
    "SASG-CYP": "OSASG-Cyprus",
    "PESG-WSAHARA": "PESG-WS",
    "OSESG-BDI": "OSESG-FG",
    "GEXP-DRC": "GoE-DRC",
    "UNGCO": "UNGC",
    "OVRA": "VRA",
    "ETHICS": "EO",
    "AOJ": "OAJ",
    "IM-MYANMAR": "IIMM",
    "OSET": "ODET",
    "RCS": "DCO",
    "UN-RGID": "UNRGID",
}


def parse_amount(amount_str: str) -> float:
    """Parse amount string to float, removing spaces and commas."""
    return float(amount_str.replace(",", "").replace(" ", "").strip())


def normalize_entity(entity: str) -> str:
    """Normalize entity code to match entities.json."""
    return ENTITY_MAPPING.get(entity, entity)
