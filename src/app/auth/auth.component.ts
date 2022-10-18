import {Component, OnInit} from '@angular/core';
import {SupabaseService} from "../supabase.service";
import {Session, User} from "@supabase/supabase-js";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  loading = false
  user: User | null = null
  session: Session | null = null
  stage: string = 'register'

  constructor(private readonly supabase: SupabaseService) {
  }

  async handleLogin(email: string, password: string) {
    try {
      this.loading = true
      const user = await this.supabase.signIn(email, password)
      console.log(user)
      if (user.error) console.log(user.error)
      if (user.data) {
        console.log(user.data)
        this.user = user.data.user
        this.session = user.data.session
      }
    } catch (error) {
      // @ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }

  async handleSignUp(email: string, password: string) {
    try {
      this.loading = true
      await this.supabase.signUp(email, password)
    } catch (error) {
      //@ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }

  async handleSignOut() {
    try {
      this.loading = true
      await this.supabase.signOut()
      this.user = null
      this.session = null
    } catch (error) {
      //@ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }

  ngOnInit(): void {
  }

  changeStage(name: string) {
    this.stage = name === 'register' || name === 'login' ? name : ''
  }
}
