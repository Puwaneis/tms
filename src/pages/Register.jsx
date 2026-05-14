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

const formSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json().catch(() => null);
      if (response.ok) {
        form.reset();
        navigate('/login');
      } else {
        setErrorMsg(responseData?.message || 'Registration failed. Please try again.');
      }
    } catch {
      setErrorMsg('Unable to connect to the server. Please try again.');
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center font-bold">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
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
              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field className="max-w-sm">
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Enter confirm password"
                        required
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        {showConfirmPassword ? <IconEye className="hover:cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)} /> : <IconEyeOff className="hover:cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
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
          <Button type="submit" className="w-full cursor-pointer" form="register-form">
            Register
          </Button>
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-center">Already have an account?</p>
            <p onClick={() => navigate("/login")}
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline hover:cursor-pointer"
            >
              Login
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Register;