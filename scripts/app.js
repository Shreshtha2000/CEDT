const signInButton = document.querySelector('.signIn');
const container1 = document.querySelector('.container');
const input = document.querySelector('input');
const username="sawantkumar";
const password="sawant123";



// the info tab click transitions
const quick=document.querySelector('#quick');
const actions=document.querySelector('#actions');
const quickData=document.querySelector('.data');
const actionData=document.querySelector('.action-data');

actions.addEventListener('click',()=>{
   quickData.style.display="none";
   actionData.style.display="flex";
   quick.style.background="transparent";
   quick.style.color="orange";
   actions.style.background="orange";
   actions.style.color="black";
});
quick.addEventListener('click',()=>{
  actionData.style.display="none";
  quickData.style.display="flex";
  actions.style.background="transparent";
  actions.style.color="orange";
  quick.style.background="orange";
  quick.style.color="black";
});



// creating a pop up 
function createPopup(){
    var popup = open("./hudpopup.html", "Popup", "width=600,height=600");
    var txtOk = popup.document.createElement("canvas");
    popup.document.body.appendChild(txtOk);
    popup.document.body.appendChild(aOk);
    }


function createPopup2(){
    var popup = open("./datapopup.html", "Popup2", "width=900,height=600");
    }

// arm-disarm button 
const armDisarm=document.querySelector('#arm-disarm');
console.log(armDisarm.textContent);
armDisarm.addEventListener('click',()=>{
  armDisarm.textContent="disarm";
  armDisarm.addEventListener('dblclick',()=>{
    armDisarm.textContent="arm";
  })
})
