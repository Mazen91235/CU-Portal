function closeDropdown(event) {
    if (!genderGroup.contains(event.target)) {
        genderDropdown.classList.remove('open');
        genderArrow.style.transform = 'rotate(0deg)';
    }
}