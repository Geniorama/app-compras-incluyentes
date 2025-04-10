import RegisterForm from "@/components/RegisterForm"
import { Card } from "flowbite-react"

export default function RegisterView() {
  return (
    <div>
        <div className="w-[90%] max-w-screen-2xl mx-auto py-5 px-2">
            <Card>
                <RegisterForm />
            </Card>
        </div>
    </div>
  )
}
