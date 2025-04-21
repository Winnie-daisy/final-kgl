const showSignUp = document.getElementById('showSignUp');
const showSignIn = document.getElementById('showSignIn');
const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');
const userType = document.getElementById('userType');
const branchInput = document.querySelector('.branch-input');

// Transition logic between forms
showSignUp.addEventListener('click', () => {
  signInForm.classList.remove('active');
  signUpForm.classList.add('active');
});

showSignIn.addEventListener('click', () => {
  signUpForm.classList.remove('active');
  signInForm.classList.add('active');
});

// Show or hide branch selection based on user type
userType.addEventListener('change', () => {
  const selectedType = userType.value;
  if (selectedType === 'buyer' || selectedType === 'salesAgent') {
    branchInput.style.display = 'block';
  } else {
    branchInput.style.display = 'none';
  }
});