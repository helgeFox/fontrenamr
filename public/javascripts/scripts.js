// var fileInput = document.querySelector('input[multiple]')

// fileInput.addEventListener('change', event => console.log('input changed'))

// fetch('/zips').then(resp => console.log(resp.json()))


async function run() {

    const response = await fetch('/zips');

    const resJson = await response.json();

    console.log(resJson)

}

run()