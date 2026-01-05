export const playNotificationSound = () => {
    try {
        const audio = new Audio('/sound.mp3')
        audio.play().catch(error => {
            console.error('Erro ao reproduzir o som:', error)
        })

    } catch (err) {
        console.error('Erro ao reproduzir o som:', err)
    }
}