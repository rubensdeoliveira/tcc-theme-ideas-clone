import AppError from '@shared/errors/AppError'

import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider'
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository'
import UpdateProfileService from './UpdateProfileService'

let fakeUsersRepository: FakeUsersRepository
let fakeHashProvider: FakeHashProvider
let updateProfile: UpdateProfileService

describe('UpdateProfile', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeHashProvider = new FakeHashProvider()
    updateProfile = new UpdateProfileService(
      fakeUsersRepository,
      fakeHashProvider
    )
  })

  it('should be able to update user profile', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@gmail.com',
      type: 'Docente',
      password: '12345678'
    })

    const updatedUser = await updateProfile.execute({
      user_id: user.id,
      name: 'Bill',
      surname: 'Gates',
      email: 'gates@gmail.com',
      type: 'Discente'
    })

    expect(updatedUser.name).toBe('Bill')
    expect(updatedUser.surname).toBe('Gates')
    expect(updatedUser.email).toBe('gates@gmail.com')
    expect(updatedUser.type).toBe('Discente')
  })

  it('should not be able to update profile from non-existing user', async () => {
    expect(
      updateProfile.execute({
        user_id: 'non-existing-user-id',
        name: 'Ada',
        surname: 'Lovelace',
        email: 'ada@gmail.com',
        type: 'Docente'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to change user email if new email already exists', async () => {
    await fakeUsersRepository.create({
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@gmail.com',
      type: 'Docente',
      password: '12345678'
    })

    const user = await fakeUsersRepository.create({
      name: 'Bill',
      surname: 'Gates',
      email: 'gates@gmail.com',
      type: 'Docente',
      password: '12345678'
    })

    await expect(
      updateProfile.execute({
        user_id: user.id,
        name: 'Bill',
        surname: 'Gates',
        email: 'ada@gmail.com',
        type: 'Docente'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should be able to update the password', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@gmail.com',
      type: 'Docente',
      password: '12345678'
    })

    const updatedUser = await updateProfile.execute({
      user_id: user.id,
      name: 'Bill',
      surname: 'Gates',
      email: 'gates@gmail.com',
      type: 'Docente',
      old_password: '12345678',
      password: 'novasenha'
    })

    expect(updatedUser.password).toBe('novasenha')
  })

  it('should not be able to update the password without old password', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@gmail.com',
      type: 'Docente',
      password: '12345678'
    })

    await expect(
      updateProfile.execute({
        user_id: user.id,
        name: 'Bill',
        surname: 'Gates',
        email: 'gates@gmail.com',
        type: 'Docente',
        password: '123123'
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to update the password with wrong old password', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@gmail.com',
      type: 'Docente',
      password: '12345678'
    })

    await expect(
      updateProfile.execute({
        user_id: user.id,
        name: 'Bill',
        surname: 'Gates',
        email: 'gates@gmail.com',
        type: 'Docente',
        old_password: 'wrong-old-password',
        password: '123123'
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
