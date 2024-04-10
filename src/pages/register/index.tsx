import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../../assets/logo.svg'
import { Container } from '../../components/container'
import { Input } from '../../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { auth } from '../../services/firebaseConnection'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../../contexts/authContext'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatorio"),
  email: z.string().email("Insira um e-mail válido.").nonempty("o campo do email é obrigatorio"),
  password: z.string().min(6, "A senha deve ter pelo menos caracteres").nonempty("O campo senha é obrigatorio")
})

type FormData = z.infer<typeof schema>


export function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })

  const { handleInfoUser } = useContext(AuthContext)

  const navigate = useNavigate();

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth);
    }

    handleLogout();
  }, [])

  async function onSubmit(data: FormData) {
    createUserWithEmailAndPassword(auth, data.email, data.password)
    .then(async (user) => {
      await updateProfile(user.user, {
        displayName: data.name
      })
      handleInfoUser({
        name: data.name,
        email: data.email,
        uid: user.user.uid
      })
      console.log("cadastrado com sucesso")
      toast.success('Cadastro efetuado com sucesso!')
      navigate("/dashboard", { replace: true })
    })
    .catch((error) => {
      console.log(error)
    })
  }

  return (
    <Container>
      <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
        <Link to={"/"} className='mb-6 max-w-sm w-full'>
          <img src={logoImg} alt="Logo do Site" className='w-full' />
        </Link>

        <form onSubmit={handleSubmit(onSubmit)} className='bg-white max-w-xl w-full rounded-lg p-4'>

          <div className='mb-3'>
            <Input
              type="text"
              placeholder="Digite seu nome completo"
              name="name"
              error={errors.name?.message}
              register={register}
            />
          </div>

          <div className='mb-3'>
            <Input
              type="email"
              placeholder="Digite seu email"
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>

          <div className='mb-3'>
            <Input
              type="password"
              placeholder="Digite sua senha"
              name="password"
              error={errors.password?.message}
              register={register}
            />
          </div>

          <button className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium' type='submit'>
            Cadastrar
          </button>

        </form>

        <Link to="/login">
          Ja possui uma conta? Faça o login!
        </Link>

      </div>
    </Container>
  )
}