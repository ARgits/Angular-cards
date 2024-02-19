import {Injectable} from '@angular/core';
import {AuthChangeEvent, createClient, Session, SupabaseClient} from "@supabase/supabase-js";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient


  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl ,
      environment.supabaseKey
      
    )
  }

  async getSession() {
    return await this.supabase.auth.getSession()
  }

  get cards() {
    return this.supabase.storage.from('cards')
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({email, password})
  }

  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({email, password, options: {data: {timeBest: 0, timeRecords: []}}})
  }

  async updateUser(update: {}) {
    return await this.supabase.auth.updateUser({
      data: update
    })
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
