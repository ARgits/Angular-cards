import {Component, OnInit} from '@angular/core';
import {SupabaseService} from "../supabase.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  loading = false

  constructor(private readonly supabase: SupabaseService) {
  }

  async handleLogin(email: string, password: string) {
    try {
      this.loading = true
      await this.supabase.signIn(email, password)
    } catch (error) {
      // @ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }

  ngOnInit(): void {
  }

}
