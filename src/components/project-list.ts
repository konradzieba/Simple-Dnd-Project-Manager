import { Component } from './base-component';
import { Project, ProjectStatus } from '../models/project';
import { DragTarget } from '../models/dnd';
import { autobind } from '../decorators/autobind';
import { projectState } from '../state/project-state';
import { ProjectItem } from './project-item';

// ProjectList Class
export class ProjectList
	extends Component<HTMLDivElement, HTMLElement>
	implements DragTarget
{
	assignedProjects: Project[];

	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`);
		this.assignedProjects = [];

		this.configure();
		this.renderContent();
	}

	@autobind
	dragOverHandler(e: DragEvent): void {
		if (e.dataTransfer && e.dataTransfer.types[0] === 'text/plain') {
			e.preventDefault();
			const listEl = this.element.querySelector('ul')!;
			listEl.classList.add('droppable');
		}
	}

	@autobind
	dropHandler(e: DragEvent): void {
		const prjId = e.dataTransfer!.getData('text/plain');
		projectState.moveProject(
			prjId,
			this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
		);
	}

	@autobind
	dragLeaveHandler(_: DragEvent): void {
		const listEl = this.element.querySelector('ul')!;
		listEl.classList.remove('droppable');
	}

	configure(): void {
		this.element.addEventListener('dragover', this.dragOverHandler);
		this.element.addEventListener('dragleave', this.dragLeaveHandler);
		this.element.addEventListener('drop', this.dropHandler);
		projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter((project) => {
				{
					if (this.type === 'active') {
						return project.status === ProjectStatus.Active;
					}
					return project.status === ProjectStatus.Finished;
				}
			});
			this.assignedProjects = relevantProjects;
			this.renderProjects();
		});
	}

	renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent =
			this.type.toUpperCase() + ' PROJECTS';
	}

	private renderProjects() {
		const listEl = <HTMLUListElement>(
			document.getElementById(`${this.type}-projects-list`)!
		);
		listEl.innerHTML = '';
		for (const prjItem of this.assignedProjects) {
			new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
		}
	}
}
