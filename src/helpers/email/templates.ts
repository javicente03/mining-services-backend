export const EmailForgotPasswordTemplate = (name: string, link: string) => {
    const html = `
        <div style="background-color: #2b2d3a; padding: 20px;">
            <div style="background-color: #272936; padding: 20px; border-radius: 10px;">
                <div style="text-align: center;">
                    <img src="" alt="Logo" style="width: 200px;">
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