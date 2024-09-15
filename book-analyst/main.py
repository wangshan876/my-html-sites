import wordExtract
import process
import json

def main():
	#{"cet46":cet4_words,"ielts":ielts_words}
	words = wordExtract.get_words()
	cet4_words = set(line.strip() for line in words['cet46'])
	ielts_words = set(line.strip() for line in words['ielts'])
	coca5000_words = set(line.strip() for line in words['coca5000'])
	folder_path = 'H:\阿里\英文原著一万册'
	result = process.count_words_in_folder(folder_path,cet4_words,ielts_words,coca5000_words)
	# result = process.get_book("./books/Doctor Who_ The Pirate Loop - Simon Guerrier.mobi",cet4_words,ielts_words)
	with open('./web/book-analyst.json', 'w') as f:
		json.dump(result, f)
main()


