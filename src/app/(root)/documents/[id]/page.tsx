import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'

import { getDocument } from '@/lib/actions/room.actions'
import { getClerkUsers } from '@/lib/actions/user.actions'
import CollaborativeRoom from '@/components/CollaborativeRoom'

export default async function Document({ params: { id } }: SearchParamProps) {
	const clerkUser = await currentUser()

	if (!clerkUser) redirect('/sign-in')

	const room = await getDocument({
		roomId: id,
		userId: clerkUser.emailAddresses[0].emailAddress,
	})

	if (!room) redirect('/')

	// Assess the permission of the user to access the document

	const userIds = Object.keys(room.usersAccesses)
	const users = await getClerkUsers({ userIds })

	const usersData = users.map((user: User) => ({
		...user,
		userType: room.usersAccesses[user.email]?.includes('room:write')
			? 'editor'
			: 'viewer',
	}))

	const currentUserType = room.usersAccesses[
		clerkUser.emailAddresses[0].emailAddress
	]?.includes('room:write')
		? 'editor'
		: 'viewer'

	return (
		<main className='flex w-full flex-col items-center'>
			<CollaborativeRoom
				roomId={id}
				roomMetadata={room.metadata}
				users={usersData}
				currentUserType={currentUserType}
			/>
		</main>
	)
}
