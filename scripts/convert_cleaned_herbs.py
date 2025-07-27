import json
from pathlib import Path
import pandas as pd


def snake_to_camel(name: str) -> str:
    parts = name.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])


def main() -> None:
    input_file = Path('cleaned_herbs.csv')
    output_file = Path('src/data/herbs_enriched.json')

    df = pd.read_csv(input_file, encoding='utf-8')
    df.columns = [snake_to_camel(col) for col in df.columns]

    # Replace NaN with None for JSON null
    records = df.where(pd.notnull(df), None).to_dict(orient='records')

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with output_file.open('w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f'Data successfully written to {output_file}')


if __name__ == '__main__':
    main()
