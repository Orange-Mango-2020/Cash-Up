import { getUsers } from '@/app/actions/auth'
import LoginScreen from '@/components/auth/LoginScreen'

export default async function LoginPage() {
  const users = await getUsers()
  return <LoginScreen users={users} />
}
