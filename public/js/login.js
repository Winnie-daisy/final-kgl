const showSignUp = document.getElementById('showSignUp');
const showSignIn = document.getElementById('showSignIn');
const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');
const userType = document.getElementById('userType');
const branchInput = document.querySelector('.branch-input');
const passwordInput = document.getElementById('password');
const lengthReq = document.querySelector('.length-req');
const numberReq = document.querySelector('.number-req');

// Transition logic between forms
if (showSignUp && showSignIn && signUpForm && signInForm) {
  showSignUp.addEventListener('click', () => {
    signInForm.classList.remove('active');
    signUpForm.classList.add('active');
  });

  showSignIn.addEventListener('click', () => {
    signUpForm.classList.remove('active');
    signInForm.classList.add('active');
  });
}

// Show or hide branch selection based on user type
if (userType && branchInput) {
  const updateBranchVisibility = () => {
    const selectedType = userType.value;
    branchInput.style.display = (selectedType === 'manager' || selectedType === 'salesAgent') ? 'block' : 'none';
  };

  userType.addEventListener('change', updateBranchVisibility);
  updateBranchVisibility(); // ← Run once on page load
}

// Real-time password validation
if (passwordInput && lengthReq && numberReq) {
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        
        // Check length requirement
        if (password.length >= 6) {
            lengthReq.classList.add('valid');
        } else {
            lengthReq.classList.remove('valid');
        }

        // Check number requirement
        if (/\d/.test(password)) {
            numberReq.classList.add('valid');
        } else {
            numberReq.classList.remove('valid');
        }
    });
}

// Form submission validation
if (signUpForm && passwordInput) {
    signUpForm.addEventListener('submit', (e) => {
        const password = passwordInput.value;
        let isValid = true;
        let errorMessage = '';

        if (password.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters long';
        }

        if (!/\d/.test(password)) {
            isValid = false;
            errorMessage = errorMessage ? errorMessage + ' and contain at least one number' : 'Password must contain at least one number';
        }

        if (!isValid) {
            e.preventDefault();
            alert(errorMessage);
        }
    });
}
