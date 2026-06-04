import docx
import json

doc = docx.Document(r'd:\Shayan\Projects\FREELANCE\Juvidoe Projects\Payment GB\JUVIDOE GBML IMPLEMENTATION (9).docx')
full_text = '\n'.join([p.text for p in doc.paragraphs])

with open('requirements_clean.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

print("Extracted successfully")
