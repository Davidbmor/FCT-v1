import mysql from 'mysql2/promise';

async function cleanSvgs() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'buffet_db'
    });

    try {
        // Obtener todos los alérgenos con sus SVGs
        const [alergenos]: any = await db.execute('SELECT id, nombre, svg FROM alergenos');

        console.log(`📋 Procesando ${alergenos.length} alérgenos...`);

        for (const alergeno of alergenos) {
            if (!alergeno.svg) {
                console.log(`⚠️  ${alergeno.nombre}: Sin SVG`);
                continue;
            }

            // Limpiar el SVG
            let cleanedSvg = alergeno.svg;

            // Remover declaración XML
            cleanedSvg = cleanedSvg.replace(/<\?xml[^?]*\?>\s*/g, '');

            // Remover comentarios
            cleanedSvg = cleanedSvg.replace(/<!--[\s\S]*?-->/g, '');

            // Remover namespaces innecesarios del tag <svg>
            cleanedSvg = cleanedSvg.replace(
                /<svg([^>]*)>/,
                (_match: string, attrs: string) => {
                    // Extraer atributos importantes
                    const widthMatch = attrs.match(/width="([^"]*)"/);
                    const heightMatch = attrs.match(/height="([^"]*)"/);
                    const viewBoxMatch = attrs.match(/viewBox="([^"]*)"/);
                    
                    let newAttrs = 'xmlns="http://www.w3.org/2000/svg"';
                    
                    if (viewBoxMatch) newAttrs += ` viewBox="${viewBoxMatch[1]}"`;
                    if (widthMatch) newAttrs += ` width="${widthMatch[1]}"`;
                    if (heightMatch) newAttrs += ` height="${heightMatch[1]}"`;
                    
                    return `<svg ${newAttrs}>`;
                }
            );

            // Remover bloques completos de metadatos
            cleanedSvg = cleanedSvg.replace(/<defs[^>]*>\s*<\/defs>/g, '');
            cleanedSvg = cleanedSvg.replace(/<sodipodi:namedview[\s\S]*?<\/sodipodi:namedview>/g, '');
            cleanedSvg = cleanedSvg.replace(/<metadata[\s\S]*?<\/metadata>/g, '');

            // Remover atributos de Inkscape/Sodipodi de todas las etiquetas
            cleanedSvg = cleanedSvg.replace(/\s+inkscape:[a-z\-]+="[^"]*"/gi, '');
            cleanedSvg = cleanedSvg.replace(/\s+sodipodi:[a-z\-]+="[^"]*"/gi, '');

            // Limpiar espacios múltiples y saltos de línea excesivos
            cleanedSvg = cleanedSvg.replace(/\s+/g, ' ');
            cleanedSvg = cleanedSvg.replace(/>\s+</g, '><');
            cleanedSvg = cleanedSvg.trim();

            // Actualizar en la base de datos
            await db.execute(
                'UPDATE alergenos SET svg = ? WHERE id = ?',
                [cleanedSvg, alergeno.id]
            );

            const reduction = ((alergeno.svg.length - cleanedSvg.length) / alergeno.svg.length * 100).toFixed(1);
            console.log(`✅ ${alergeno.nombre}: ${alergeno.svg.length} → ${cleanedSvg.length} bytes (${reduction}% reducción)`);
        }

        console.log('\n🎉 ¡Todos los SVGs han sido limpiados!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.end();
    }
}

cleanSvgs();
