// app/register/page.tsx
import RegisterView from "@/views/RegisterView"

export default function Register() {
  return (
    <RegisterView />
  )
}


// import { useState } from "react";
// import { registerUser } from "@/lib/auth";
// import { useRouter } from "next/navigation";

// export default function RegisterPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const router = useRouter();

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     try {
//       await registerUser(email, password);
//       router.push("/dashboard");
//     } catch (error: unknown) {
//         if (error instanceof Error) {
//             setError(error.message);
//         } else {
//             setError("Ocurrió un error desconocido al registrarse.");
//         }
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <h1 className="text-2xl font-bold mb-4">Registrarse</h1>
//       {error && <p className="text-red-500">{error}</p>}
//       <form onSubmit={handleRegister} className="flex flex-col space-y-4">
//         <input
//           type="email"
//           placeholder="Correo"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="border p-2"
//           required
//         />
//         <input
//           type="password"
//           placeholder="Contraseña"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="border p-2"
//           required
//         />
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
//           Registrarse
//         </button>
//       </form>
//     </div>
//   );
// }
