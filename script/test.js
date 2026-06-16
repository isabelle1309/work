async function addUser() {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            name: "Isabelle",
            age: 21,
            createdAt: new Date()
        });

        console.log("Document written with ID:", docRef.id);
    } catch (e) {
        console.error("Error adding document:", e);
    }
}

const button = document.getElementById("createBtn");

button.addEventListener("click", ()=>{
    event.preventDefault();
    addUser();
})
