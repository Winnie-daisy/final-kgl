const showSignUp = document.getElementById('showSignUp');
const showSignIn = document.getElementById('showSignIn');
const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');
const userType = document.getElementById('userType');
const branchInput = document.querySelector('.branch-input');

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
