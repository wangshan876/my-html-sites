import requests
import re
import nltk

from collections import defaultdict

import os.path
import requests
import epub
import ebooklib
from ebooklib import epub as epublib
import chardet
# from ebooklib import mobi as mobilib
nltk.download('wordnet')
nltk.download('omw-1.4')
from nltk.stem import WordNetLemmatizer


def get_book(filepath_or_url,cet4_words,ielts_words,coca5000_words):
    _, ext = os.path.splitext(filepath_or_url)
    ext = ext.lower()
    if ext == '.txt':
        with open(filepath_or_url, 'rb') as f:
            encoding = chardet.detect(f.read())['encoding']
            f.seek(0)
            if filepath_or_url.endswith('.txt'):
                book = f.read().decode(encoding)
            else:
                raise ValueError("Unsupported file format.")
    elif ext == '.epub':
        book = ebooklib.epub.read_epub(filepath_or_url)
        book_items = book.get_items()
        book = '\n'.join([item.get_content().decode('utf-8', 'ignore') for item in book_items if item.get_type() == ebooklib.ITEM_DOCUMENT])
    elif ext == '.mobi':
        # code for converting MOBI to EPUB using Calibre command line tool
        os.system(f'ebook-convert "{filepath_or_url}" "{filepath_or_url[:-4]}.epub"')
        book = ebooklib.epub.read_epub(f"{filepath_or_url[:-4]}.epub")
        book_items = book.get_items()
        book = '\n'.join([item.get_content().decode('utf-8', 'ignore') for item in book_items if item.get_type() == ebooklib.ITEM_DOCUMENT])
    else:
        response = requests.get(filepath_or_url)
        if response.ok:
            if 'epub' in response.headers['Content-Type']:
                book = ebooklib.epub.read_epub_bytes(response.content)
                book_items = book.get_items()
                book = '\n'.join([item.get_content().decode('utf-8', 'ignore') for item in book_items if item.get_type() == ebooklib.ITEM_DOCUMENT])
            elif 'text/plain' in response.headers['Content-Type']:
                book = response.content.decode('utf-8', 'ignore')
            else:
                print('Unsupported file format')
                return
    cet4_words_counts = {}
    ielts_words_counts = {}
    coca5000_words_counts = {}
    lemmatizer = WordNetLemmatizer()

    for word in book.lower().split():
        word = lemmatizer.lemmatize(word)
        if word in cet4_words:
            cet4_words_counts[word]=cet4_words_counts.get(word, 0) + 1
        if word in ielts_words:
            ielts_words_counts[word]=ielts_words_counts.get(word, 0) + 1
        if word in coca5000_words:
            coca5000_words_counts[word]=coca5000_words_counts.get(word, 0) + 1

    return {"cet4":cet4_words_counts,"ielts":ielts_words_counts,"coca5000_words":coca5000_words_counts}


def count_words_in_folder(folder_path,cet4_words,ielts_words,coca5000_words):
    result = {}
    for root, _, files in os.walk(folder_path):
        for file_name in files:
            print(file_name)
            file_path = os.path.join(root, file_name)
            try:
                book_name = os.path.splitext(file_name)[0]
                result[book_name] = get_book(file_path,cet4_words,ielts_words,coca5000_words)
            except Exception as e:
                print(f"Error processing file '{file_path}': {str(e)}")

    return result

