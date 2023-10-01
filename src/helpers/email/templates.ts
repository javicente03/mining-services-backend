import config from "../../config";

export const EmailForgotPasswordTemplate = (name: string, link: string) => {
    const html = `
        <div style="background-color: #2b2d3a; padding: 20px;">
            <div style="background-color: #272936; padding: 20px; border-radius: 10px;">
                <div style="text-align: center;">
                    <img src="http://sitiotempms.s3-website-us-east-1.amazonaws.com/assets/logo_sidebar-afd09d73.png" alt="Logo" style="width: 200px;">
                </div>
                <div style="text-align: center;">
                    <h2 style="font-size: 24px; font-weight: 600; color: #b4d939;">Recuperar contraseña</h2>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Hola ${name}, hemos recibido una solicitud para recuperar tu contraseña.</p>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Si no has sido tú, por favor ignora este correo.</p>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Si has sido tú, por favor haz click en el siguiente botón.</p>
                    <a href="${link}" style="text-decoration: none; background-color: #b0db43; color: #2b2d3a; padding: 10px 20px; border-radius: 5px; font-size: 20px; font-weight: 600;">Recuperar contraseña</a>
                </div>
            </div>
        </div>
    `;
    return html;
}

export const EmailNuevaSolicitudTemplate = (solicitud: any) => {
    const html = `
        <div style="background-color: #2b2d3a; padding: 20px;">
            <div style="background-color: #272936; padding: 20px; border-radius: 10px;">
                <div style="text-align: center;">
                    <img src="http://sitiotempms.s3-website-us-east-1.amazonaws.com/assets/logo_sidebar-afd09d73.png" alt="Logo" style="width: 200px;">
                </div>
                <div style="text-align: center;">
                    <h2 style="font-size: 24px; font-weight: 600; color: #b4d939;">Nueva solicitud</h2>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Hemos recibido una nueva solicitud para crear una OT de parte de ${solicitud.user?.name}.</p>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Por favor haz click en el siguiente botón para verla.</p>
                    <a href="${config.DOMAIN_FRONTEND}/admin/requests/${solicitud.id}" style="text-decoration: none; background-color: #b0db43; color: #2b2d3a; padding: 10px 20px; border-radius: 5px; font-size: 20px; font-weight: 600;">Ver solicitud</a>
                </div>
            </div>
        </div>
    `;
    return html;
}

export const EmailSolicitudRechazadaTemplate = (solicitud: any) => {
    const html = `
        <div style="background-color: #2b2d3a; padding: 20px;">
            <div style="background-color: #272936; padding: 20px; border-radius: 10px;">
                <div style="text-align: center;">
                    <img src="http://sitiotempms.s3-website-us-east-1.amazonaws.com/assets/logo_sidebar-afd09d73.png" alt="Logo" style="width: 200px;">
                </div>
                <div style="text-align: center;">
                    <h2 style="font-size: 24px; font-weight: 600; color: #b4d939;">Solicitud rechazada</h2>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Hola ${solicitud.user?.name}, la solicitud N°${solicitud.id} para crear una OT ha sido rechazada.</p>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Por favor haz click en el siguiente botón para ver el detalle.</p>
                    <a href="${config.DOMAIN_FRONTEND}/requests/${solicitud.id}" style="text-decoration: none; background-color: #b0db43; color: #2b2d3a; padding: 10px 20px; border-radius: 5px; font-size: 20px; font-weight: 600;">Ver solicitud</a>
                </div>
            </div>
        </div>
    `;
    return html;
}

export const EmailSolicitudAprobadaPresupuestoTemplate = (solicitud: any) => {
    const html = `
        <div style="background-color: #2b2d3a; padding: 20px;">
            <div style="background-color: #272936; padding: 20px; border-radius: 10px;">
                <div style="text-align: center;">
                    <img src="http://sitiotempms.s3-website-us-east-1.amazonaws.com/assets/logo_sidebar-afd09d73.png" alt="Logo" style="width: 200px;">
                </div>
                <div style="text-align: center;">
                    <h2 style="font-size: 24px; font-weight: 600; color: #b4d939;">Solicitud aprobada</h2>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Hola ${solicitud.user?.name}, la solicitud N°${solicitud.id} para crear una OT ha sido aprobada.</p>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Por favor haz click en el siguiente botón para ver el detalle del presupuesto.</p>
                    <a href="${config.DOMAIN_FRONTEND}/requests/${solicitud.id}" style="text-decoration: none; background-color: #b0db43; color: #2b2d3a; padding: 10px 20px; border-radius: 5px; font-size: 20px; font-weight: 600;">Ver solicitud</a>
                </div>
            </div>
        </div>
    `;
    return html;
}

export const EmailSolicitudRechazadaClientePresupuestoTemplate = (solicitud: any) => {
    const html = `
        <div style="background-color: #2b2d3a; padding: 20px;">
            <div style="background-color: #272936; padding: 20px; border-radius: 10px;">
                <div style="text-align: center;">
                    <img src="http://sitiotempms.s3-website-us-east-1.amazonaws.com/assets/logo_sidebar-afd09d73.png" alt="Logo" style="width: 200px;">
                </div>
                <div style="text-align: center;">
                    <h2 style="font-size: 24px; font-weight: 600; color: #b4d939;">Solicitud rechazada</h2>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">La solicitud N°${solicitud.id} de ${solicitud.user?.name} ha sido rechazada por el cliente.</p>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Por favor haz click en el siguiente botón para ver el detalle.</p>
                    <a href="${config.DOMAIN_FRONTEND}/admin/ots/budget/${solicitud.id}" style="text-decoration: none; background-color: #b0db43; color: #2b2d3a; padding: 10px 20px; border-radius: 5px; font-size: 20px; font-weight: 600;">Ver solicitud</a>
                </div>
            </div>
        </div>
    `;
    return html;
}

export const EmailSolicitudAprobadaClientePresupuestoTemplate = (solicitud: any) => {
    const html = `
        <div style="background-color: #2b2d3a; padding: 20px;">
            <div style="background-color: #272936; padding: 20px; border-radius: 10px;">
                <div style="text-align: center;">
                    <img src="http://sitiotempms.s3-website-us-east-1.amazonaws.com/assets/logo_sidebar-afd09d73.png" alt="Logo" style="width: 200px;">
                </div>
                <div style="text-align: center;">
                    <h2 style="font-size: 24px; font-weight: 600; color: #b4d939;">Presupuesto Aceptado</h2>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">El presupuesto de la solicitud N°${solicitud.id} de ${solicitud.user?.name} ha sido aceptado por el cliente.</p>
                    <p style="font-size: 16px; font-weight: 400; color: #fff;">Por favor haz click en el siguiente botón para ver el detalle.</p>
                    <a href="${config.DOMAIN_FRONTEND}/admin/ots/budget/${solicitud.id}" style="text-decoration: none; background-color: #b0db43; color: #2b2d3a; padding: 10px 20px; border-radius: 5px; font-size: 20px; font-weight: 600;">Ver solicitud</a>
                </div>
            </div>
        </div>
    `;
    return html;
}