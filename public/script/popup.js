const addFriendButton = document.getElementById('addFriend');
    const viewFriendButton = document.getElementById('viewFriend');
    const addpopup = document.getElementById('addpopup');
    const viewpopup = document.getElementById('viewpopup');
    const addclosePopupButton = document.getElementById('addclosePopup');
    const viewclosePopupButton = document.getElementById('viewclosePopup');


    addFriendButton.addEventListener('click', () => {
        addpopup.classList.remove('hidden');
    });

    viewFriendButton.addEventListener('click', () => {
        viewpopup.classList.remove('hidden');
    });

    addclosePopupButton.addEventListener('click', () => {
        addpopup.classList.add('hidden');
    });

    viewclosePopupButton.addEventListener('click', () => {
        viewpopup.classList.add('hidden');
    });