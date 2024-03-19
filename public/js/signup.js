const name = document.getElementById("sign-up-name").value;
const project = document.getElementById("sign-up-project").value;
const email = document.getElementById("sign-up-email").value;
const password = document.getElementById("sign-up-password");

const setValues = (event) => {
  event.preventDefault();
  console.log(event.target)
};

const signupApi = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        project,
        email,
        password,
      }),
    });
    console.log(await response.text());
  } catch (error) {
    console.log(error);
  }
};
