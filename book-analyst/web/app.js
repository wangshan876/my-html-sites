
const menus = document.querySelector("#menu")
const myChart = document.querySelector("#myChart")
var backButton = document.getElementById('back-button');
var menuContainer = document.getElementById('menu-container');
var chartContainer = document.getElementById('chart-container');
var backButtonContainer = document.getElementById('back-button-container');
let chartView = null;
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

function getjsondata(){
	let books = {}
	return fetch('book-analyst.json')
    .then(response => response.json())
    .then(datas => {
		let booknames = Object.keys(datas)
		booknames.forEach(n=>{
			let items = Object.keys(datas[n])
			books[n] = {}
			items.forEach(item=>{
				let words = Object.keys(datas[n][item])
				books[n][item] = words.length
			})
		})
		return books
	}).catch(err=>console.error(err))
}

function draw(labels,data){
	var ctx = document.getElementById('myChart').getContext('2d');
	chartView &&chartView.destroy()
	chartView = new Chart(ctx, {
		type: 'pie',
		data: {
			labels: labels,
			datasets: [{
				label: '# 词频',
				data: data,
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
				],
				borderWidth: 1
			}]
		},
		options: {
			title: {
				display: true,
				text: 'My Pie Chart'
			}
		}
	});
}

async function startApp(){
	let books = await getjsondata()
	let booknames = Object.keys(books)
	const li = document.createElement("li")
	booknames.forEach(n=>{
		const item = li.cloneNode(true)
		item.setAttribute("book",n)
		item.textContent = n;
		item.addEventListener("click",function(event){
			const book = books[n]
			let lables,data=[];
			lables = Object.keys(books[n])
			lables.forEach(lable=>data.push(book[lable]))
			event.preventDefault();
			if(viewportWidth<=600){
				chartContainer.style.display="block"
				backButtonContainer.style.display="block"
			}
			draw(lables,data)
		})
		menus.appendChild(item)
	})
	if(viewportWidth<=600){
		chartContainer.style.paddingTop="50px"
		chartContainer.style.position="fixed"
		chartContainer.style.width="100%"
		backButton.addEventListener("click",function(){
			chartContainer.style.display="none"
			backButtonContainer.style.display="none"
		})
	}
}

window.onload=()=>{
	startApp()
	
}

