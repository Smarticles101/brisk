import { promises as fs } from "fs";

export async function getTagTemplates() {
    const template_files = await fs.readdir("tag-templates");

    const templates = template_files.map(async (template_file) => {
        const template_path = `tag-templates/${template_file}`;
        const template_content = await fs.readFile(template_path, "utf8");
        const template_name = template_file.replace(".json", "");

        return {
            name: template_name,
            content: JSON.parse(template_content),
        };
    });

    return Promise.all(templates);
}

export async function getTagTemplate(name: string) {
    const templates = await getTagTemplates();

    return templates.find((template) => template.name === name)?.content;
}
