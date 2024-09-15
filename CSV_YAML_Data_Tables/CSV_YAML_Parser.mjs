const scripts = [
    'https://cdn.jsdelivr.net/npm/js-yaml/dist/js-yaml.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js'
].map(src => {
    const script = document.createElement('script');
    script.src = src;
    return script;
});
document.head.append(...scripts);


const parserHtml = `
    <select id="fileType">
        <option value="csv">CSV</option>
        <option value="yaml">YAML</option>
    </select>
    <input type="file" id="fileInput" accept=".csv,.yml,.yaml" />
`

export function createParser(){
    const fileParser = document.querySelector('#file-parse');
    fileParser.innerHTML = parserHtml
}
export function parseFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file first.');
        return;
    }

    const fileType = document.getElementById('fileType').value;


    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const fileContent = event.target.result;

            if (fileType === 'csv') {
                Papa.parse(fileContent, {
                    header: true,
                    dynamicTyping: true,
                    complete: function(results) {
                        resolve(results.data);
                    },
                    error: function(error) {
                        reject(new Error('Error parsing CSV: ' + error.message));
                    }
                });
            } else if (fileType === 'yaml') {
                try {
                    const data = jsyaml.load(fileContent);

                    resolve(data);
                } catch (e) {
                    reject(new Error('Error parsing YAML: ' + e.message));
                }
            } else {
                reject(new Error('Unsupported file type'));
            }
        };

        reader.readAsText(file);
    });
}