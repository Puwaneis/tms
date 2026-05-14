import { useState } from "react";
import { Button } from "#components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#components/ui/card"
import { Input } from "#components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#components/ui/input-group"
import {
  Field,
  FieldLabel,
  FieldError
} from "#components/ui/field"
import { IconEye, IconEyeOff } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Controller, useForm } from "react-hook-form"
import { useAuth } from "../context/AuthContext"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: data.email, password: data.password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json().catch(() => null);
      if (response.ok) {
        login(responseData.token);
        navigate('/');
      } else {
        setErrorMsg(responseData?.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setErrorMsg('Unable to connect to the server. Please try again.');
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center font-bold">Login to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field className="max-w-sm">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter email"
                      required
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError className="text-red-500 text-xs text-start">{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field className="max-w-sm">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        required
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        {showPassword ? <IconEye className="hover:cursor-pointer" onClick={() => setShowPassword(!showPassword)} /> : <IconEyeOff className="hover:cursor-pointer" onClick={() => setShowPassword(!showPassword)} />}
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError className="text-red-500 text-xs text-start">{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {errorMsg && (
            <p className="w-full text-sm text-destructive text-center rounded-lg bg-destructive/10 px-3 py-2">{errorMsg}</p>
          )}
          <Button type="submit" className="w-full cursor-pointer" form="login-form">
            Login
          </Button>
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-center">Don't have an account?</p>
            <p onClick={() => navigate("/register")}
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline hover:cursor-pointer"
            >
              Sign up
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login;