const myImage = document.querySelector("img");

myImage.onclick = () => {
    const mySrc = myImage.getAttribute("src");
    if (mySrc === "images/hanoi.jpg") {
        myImage.setAttribute("src", "images/hanoi1.jpg");
    } else {
        myImage.setAttribute("src", "images/hanoi.jpg");
    }
};

let myButton = document.querySelector("button");
let myHeading = document.querySelector("h1");

function setUserName() {
    const myName = prompt("Please enter your first name.");
    if (!myName) {
        setUserName();
    } else {
        localStorage.setItem("name", myName);
        myHeading.textContent = `Welcome to Hanoi, ${myName}`;
    }
}

if (!localStorage.getItem("name")){
    setUserName();
} else {
    const storedName = localStorage.getItem("name");
    myHeading.textContent = `Welcome to Hanoi, ${storedName}`;  
}

myButton.onclick = () => {
    setUserName();
};