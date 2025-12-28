import loginImage from "../../assets/image.png"
import { useLoginMutation } from "./service/useLogin"
import type { ILoginData } from "../type"
import type { FormProps } from "antd"
import { Button, Form, Input } from "antd"
import Cookies from "js-cookie"
import { Pill, ShieldCheck, Hospital } from "lucide-react"

export const Login = () => {
  const { mutate, contextHolder } = useLoginMutation()

  const onSubmit = (data: ILoginData) => {
    mutate(data)
  }

  const cookie = Cookies.get("token")
  if (cookie) {
    window.location.href = "/"
  }

  const onFinishFailed: FormProps<ILoginData>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4">
      {contextHolder}

      {/* Main Container */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Branding & Image */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 p-12 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          {/* Medical Icons */}
          <div className="absolute top-8 left-8 text-white/20">
            <Pill className="w-12 h-12" />
          </div>
          <div className="absolute bottom-8 right-8 text-white/20">
            <Hospital className="w-12 h-12" />
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center space-y-6">
            {/* Pharmacy Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Pill className="w-12 h-12 text-teal-600" />
              </div>
            </div>

            {/* Pharmacy Image Placeholder */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <img
                src={loginImage}
                alt="Pharmacy"
                className="w-full h-full object-cover rounded-2xl shadow-xl"
              />
            </div>

            {/* Text Content */}
            <h1 className="text-4xl font-bold text-white mb-4">Dorixona Tizimi</h1>
            <p className="text-lg text-teal-50 max-w-md">
              Zamonaviy dorixona boshqaruv tizimiga xush kelibsiz. Sog'liqni saqlash uchun ishonchli hamkoringiz.
            </p>

            {/* Feature Icons */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-teal-50">Xavfsiz</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-teal-50">Ishonchli</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Hospital className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-teal-50">Professional</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-teal-600 rounded-full items-center justify-center mb-4">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Dorixona Tizimi</h2>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Kirish</h2>
            <p className="text-gray-600">Davom etish uchun hisobingizga kiring</p>
          </div>

          {/* Login Form */}
          <Form
            name="login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onSubmit}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="space-y-2"
          >
            <Form.Item<ILoginData>
              label={<span className="text-gray-700 font-medium">Foydalanuvchi nomi</span>}
              name="username"
              rules={[{ required: true, message: "Iltimos, foydalanuvchi nomingizni kiriting!" }]}
            >
              <Input size="large" placeholder="Foydalanuvchi nomini kiriting" className="rounded-lg" />
            </Form.Item>

            <Form.Item<ILoginData>
              label={<span className="text-gray-700 font-medium">Parol</span>}
              name="password"
              rules={[{ required: true, message: "Iltimos, parolingizni kiriting!" }]}
            >
              <Input.Password size="large" placeholder="Parolni kiriting" className="rounded-lg" />
            </Form.Item>

            <Form.Item className="mb-0 pt-4">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 border-none rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Kirish
              </Button>
            </Form.Item>
          </Form>

          {/* Footer Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Tizimga kirish orqali siz{" "}
              <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                Foydalanish shartlari
              </a>
              ga rozilik bildirasiz
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
