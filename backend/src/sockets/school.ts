
import { Server, Socket } from 'socket.io';

interface StudentEvents {
    studentId: string;
    type: 'camera' | 'mic' | 'tab' | 'ai';
    status: boolean | string;
    riskLevel?: string;
}

export const setupSchoolSocket = (io: Server) => {
    const schoolNamespace = io.of('/school');

    schoolNamespace.on('connection', (socket: Socket) => {
        console.log('User connected to School Monitor:', socket.id);

        socket.on('join-monitor', (examId: string) => {
            socket.join(`exam-${examId}`);
            console.log(`User ${socket.id} joined exam monitor ${examId}`);
        });

        // Simulate random events for demo purposes
        // In reality, this would be receiving events from student clients
        const simulationInterval = setInterval(() => {
            const eventType = Math.random() > 0.5 ? 'TAB_SWITCH' : 'FACE_MISSING';
            const studentId = Math.floor(Math.random() * 8 + 1).toString(); // Mock IDs 1-8

            schoolNamespace.to('exam-EXAM-2025-A7').emit('student-event', {
                studentId,
                type: eventType,
                timestamp: new Date(),
                severity: 'MEDIUM'
            });
        }, 5000);

        socket.on('disconnect', () => {
            clearInterval(simulationInterval);
            console.log('Monitor disconnected');
        });
    });
};
