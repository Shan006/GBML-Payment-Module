import docx
import sys

doc = docx.Document(r'd:\Shayan\Projects\FREELANCE\Juvidoe Projects\Payment GB\JUVIDOE GBML IMPLEMENTATION (9).docx')
full_text = '\n'.join([p.text for p in doc.paragraphs])
sys.stdout.buffer.write(full_text.encode('utf-8'))
