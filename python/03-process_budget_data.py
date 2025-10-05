import csv
import json
from pathlib import Path

def parse_amount(amount_str: str) -> float:
    """Parse amount string to float, removing spaces and commas."""
    return float(amount_str.replace(',', '').replace(' ', '').strip())

def main():
    budget_data = {}
    un_secretariat_total = 0
    un_dpo_total = 0
    
    # Read UN System expenses (2023 data)
    system_csv = Path('data/downloads/budget/un-system-expenses.csv')
    with open(system_csv, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            year_key = next((k for k in row.keys() if 'year' in k.lower()), None)
            agency_key = next((k for k in row.keys() if 'agency' in k.lower()), None)
            amount_key = next((k for k in row.keys() if 'amount' in k.lower()), None)
            
            if year_key and agency_key and amount_key and row[year_key] == '2023':
                entity = row[agency_key].strip()
                amount = parse_amount(row[amount_key])
                if entity:
                    # Store UN and UN-DPO for correction calculation but don't include in final data
                    if entity == 'UN':
                        un_secretariat_total = amount
                    elif entity == 'UN-DPO':
                        un_dpo_total = amount
                    else:
                        budget_data[entity] = amount
    
    # Read UN Secretariat expenses (2023 data - aggregate by entity)
    secretariat_detailed_sum = 0
    secretariat_csv = Path('data/downloads/budget/un-secretariat-expenses.csv')
    with open(secretariat_csv, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            year_key = next((k for k in row.keys() if k.upper() == 'YEAR'), None)
            entity_key = next((k for k in row.keys() if k.upper() == 'ENTITY'), None)
            amount_key = next((k for k in row.keys() if k.upper() == 'AMOUNT'), None)
            
            if year_key and entity_key and amount_key and row[year_key] == '2023':
                entity = row[entity_key].strip()
                amount = parse_amount(row[amount_key])
                if entity:
                    budget_data[entity] = budget_data.get(entity, 0) + amount
                    secretariat_detailed_sum += amount
    
    # Add double counting correction: System total (UN + DPO) minus detailed sum
    # This is negative because detailed data includes double counting
    correction = (un_secretariat_total + un_dpo_total) - secretariat_detailed_sum
    budget_data['UN-Secretariat-Correction'] = correction
    
    # Write to JSON
    output_path = Path('public/budget.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(budget_data, f, indent=2)
    
    print(f"Processed {len(budget_data)} entities")
    print(f"UN Secretariat (system): ${un_secretariat_total:,.0f}")
    print(f"UN-DPO (system): ${un_dpo_total:,.0f}")
    print(f"Secretariat detailed sum: ${secretariat_detailed_sum:,.0f}")
    print(f"Double counting correction: ${correction:,.0f}")
    print(f"Output written to {output_path}")

if __name__ == '__main__':
    main()


import json
from pathlib import Path
budget = json.loads(Path("public/budget.json").read_text())
sum(budget.values())
