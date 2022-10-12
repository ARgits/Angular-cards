import {Injectable} from '@angular/core';
import {AuthChangeEvent, createClient, Session, SupabaseClient} from "@supabase/supabase-js";
import {environment} from "../environment";

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient


  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    )
  }

  get user() {
    return this.supabase.auth.user()
  }

  get session() {
    return this.supabase.auth.session()
  }

  get cards() {
    return this.supabase.storage.from('cards')
  }

  get profile() {
    return this.supabase
      .from('profiles')
      .select('username, website, avatar_url')
      .eq('id', this.user?.id)
      .single()
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signIn({email, password})
  }

  async signUp(email: string, password: string) {
    await this.supabase.auth.signUp({email, password})
  }

  signOut() {
    return this.supabase.auth.signOut()
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  async downLoadImage(path: string) {
    return this.supabase.storage.from('cards').getPublicUrl(path)
  }

}
