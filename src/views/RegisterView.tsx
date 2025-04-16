import RegisterForm from "@/components/RegisterForm"
import { Card } from "flowbite-react"

export default function RegisterView() {
  return (
    <div>
        <div className="lg:w-[90%] max-w-screen-2xl mx-auto lg:py-5 lg:px-2">
            <Card>
                <RegisterForm />
            </Card>
        </div>
    </div>
  )
}
