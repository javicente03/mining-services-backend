import express from 'express';
import compression from 'compression';
import config from './config';
import authRouter from './routes/auth.routes';
import authAdminRouter from './routes/admin/auth.routes';
import solicitudesRouter from './routes/solicitudes.routes';
import solicitudesRouterAdmin from './routes/admin/solicitudes.routes';
import otsRouterAdmin from './routes/admin/ots.routes';
import otsRouter from './routes/ots.routes';
import usersAdminRouter from './routes/admin/users.routes';
import companiesAdminRouter from './routes/admin/companies.routes';
import formsAdminRouter from './routes/admin/forms.routes';

const app = express();

app.set('port', config.PORT || 3000);
app.use(compression());
app.use(express.static('public'));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use((req: any, res: any, next: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.get('/raiz', (req, res) => {
    res.send('200');
});

// Routes Users
app.use('/api/auth', authRouter);
app.use('/api/requests', solicitudesRouter);
app.use('/api/ots', otsRouter);

// Routes Admin
app.use('/api/admin/auth', authAdminRouter);
app.use('/api/admin/requests', solicitudesRouterAdmin);
app.use('/api/admin/ots', otsRouterAdmin);
app.use('/api/admin/users', usersAdminRouter);
app.use('/api/admin/companies', companiesAdminRouter);
app.use('/api/admin/forms', formsAdminRouter);

export default app;