const email = document.getElementById("log-in-email").value;
const password = document.getElementById("log-in-password").value;

const setValues = (event) => {
  event.preventDefault();
  console.log(event.target)
};


// const loginApi = async (event) => {
//   try {
//     const response = await fetch("/api/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//         password,
//       }),
//     });
//     console.log(await response.text());
//   } catch (error) {
//     console.log(error);
//   }
// };
