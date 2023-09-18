import http from 'http';
import app from './app';

const server = http.createServer(app);

server.listen(app.get('port'), () => {
    console.log(`Server is listening on port ${app.get('port')}`);
}
);