function handleHorizontalContainerNavigation(containerId, state, parameters = {}) {
	const container = document.getElementById(containerId);
	if (!container) return false;
	switch (state) {
		case 'visible':
			container.style.display = 'flex';
			container.classList.add('nav-visible');
			container.classList.remove('nav-hidden');
			break;
		case 'hidden':
			container.classList.add('nav-hidden');
			container.classList.remove('nav-visible');
			container.style.display = 'none';
			break;
		default:
			break;
	}
	return true;
}

window.handleHorizontalContainerNavigation = handleHorizontalContainerNavigation;

