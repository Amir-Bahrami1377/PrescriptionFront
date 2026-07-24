import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as ticketingApi from '@/api/ticketingApi'

export const useTicketStore = defineStore('tickets', () => {
  const myTickets = ref([])
  const loaded = ref(false)

  async function fetchMyTickets() {
    myTickets.value = (await ticketingApi.listMyTickets()) ?? []
    loaded.value = true
    return myTickets.value
  }

  async function createTicket(payload) {
    const ticket = await ticketingApi.createTicket(payload)
    await fetchMyTickets()
    return ticket
  }

  return { myTickets, loaded, fetchMyTickets, createTicket }
})
