import { defineStore } from 'pinia'
import { api } from '../utils/api'

export const useLobbyStore = defineStore('lobby', {
  state: () => ({
    rooms: [],
    currentRoom: null
  }),

  actions: {
    async createRoom(roomData) {
      try {
        const response = await api.rooms.create(roomData)
        await this.fetchRooms()
        return response.data
      } catch (error) {
        throw new Error(error.message || '创建房间失败')
      }
    },

    async fetchRooms() {
      try {
        const response = await api.rooms.list()
        this.rooms = response.data
      } catch (error) {
        throw new Error(error.message || '获取房间列表失败')
      }
    },

    async joinRoom(roomId) {
      try {
        const response = await api.rooms.join(roomId)
        this.currentRoom = response.data
      } catch (error) {
        throw new Error(error.message || '加入房间失败')
      }
    },

    setCurrentRoom(room) {
      this.currentRoom = room
    },

    async deleteRoom(roomId) {
      try {
        await api.rooms.delete(roomId)
        await this.fetchRooms()
      } catch (error) {
        throw new Error(error.message || '删除房间失败')
      }
    }
  }
}) 