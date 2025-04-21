const validateUserForm = (e) => {
    const fullname = document.getElementById("fullname")
    const email = document.getElementById("email")
    const state = document.getElementById("imput-state")
    const gender = document.getElementById("gender")
    let errorCount = 0;

    const nameRegex = /^[A-Za-z\s]{2,100}$/;
    if(!nameRegex.test(fullname.value.trim())){
        fullname.style.border = "1px solid red";
        document.getElementById("fullnameError").style.color = "red";
        document.getElementById("fullnameError").textContent = "please enter full name. Alphabet characters only 2-100";
        errorCount++
    }else{
        fullname.style.border = "1px solid green";
        document.getElementById("fullnameError").textContent = "";
    }

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email.value.trim())){
     email.style.border = "1px solid red";
     document.getElementById("emailError").style.color = "red";
     document.getElementById("emailError").textContent = "please enter valid email address";
     errorCount++
    }else{
         email.style.border = "1px solid green";
         document.getElementById("emailError").textContent = "";    

    }
    //    state validation/dropdown
    if(state.value === "" || state.value === "Select State"){
        state.style.border = "1px solid red";
        document.getElementById("stateError").style.color = "red";
        document.getElementById("stateError").textContent = "please select a state";
        errorCount++
    }else{
        state.style.border = "1px solid green";
        document.getElementById("stateError").textContent = "";
    }

    if (gender) {
        document.getElementById("genderError").style.color = "red";
        document.getElementById("genderError").textContent = "please select your gender"
        errorCount++
    } else {
        document.getElementById("genderError").textContent = "";
    }
}

   if(errorCount >0){
    e.preventDefault();
    return false;    
    } 
    return true;

