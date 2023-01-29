import 'bulma/css/bulma.css';
import { useEffect } from 'react';
import { Component, FormEvent } from 'react';
import { Block, Button, Form, Heading, Modal, Navbar, Table } from 'react-bulma-components';
import './App.css';

export interface Alumnus {
    id: number;
    fullName: string;
    currentEmployer: string | undefined;
    previousEmployers: Array<string>;
    studyStartDate: Date;
    studyEndDate: Date;
    description: string;
}

interface State {
    alumni: Array<Alumnus>,
    selectedAlumnus: Alumnus | undefined,
    showAlumnus: boolean,
}

export default class App extends Component<{}, State> {
    fetchedAlumni: boolean;
    constructor(props: any) {
        super(props);
        this.fetchedAlumni = false;
        this.state = {
            alumni: [],
            selectedAlumnus: undefined,
            showAlumnus: false,
        };
    }
    render() {
        return (
            <div className="App">
                <Navbar>
                    <Navbar.Item>
                        <Heading weight='light' size={4}>
                            BINFO-CEP Alumni Database
                        </Heading>
                    </Navbar.Item>
                    <Navbar.Container align="right">
                        <Navbar.Item>
                            <Button color="primary" onClick={() => this.setState({ showAlumnus: true, selectedAlumnus: undefined })}>
                                Create new alumnus
                            </Button>
                        </Navbar.Item>
                    </Navbar.Container>
                </Navbar>
                <Table size='fullwidth'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Current Employer</th>
                            <th>Previous Employers</th>
                            <th>Study Start Date</th>
                            <th>Study End Date</th>
                            <th>Description</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.alumni.map((alumnus: any) => (
                            <tr key={alumnus.id}>
                                <td>{alumnus.id}</td>
                                <td>{alumnus.fullName}</td>
                                <td>{alumnus.currentEmployer}</td>
                                <td>{alumnus.previousEmployers?.join('; ')}</td>
                                <td>{dateToString(alumnus.studyStartDate)}</td>
                                <td>{dateToString(alumnus.studyEndDate)}</td>
                                <td>{alumnus.description}</td>
                                <td>
                                    <Button color="primary" onClick={() => this.setState({ showAlumnus: true, selectedAlumnus: alumnus })}>
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <AlumniEditPopup alumnus={this.state.selectedAlumnus}
                    updateAlumnus={(alumnus: Alumnus) => this.updateAlumnus(alumnus)}
                    createAlumnus={(alumnus: Alumnus) => this.createAlumnus(alumnus)}
                    deleteAlumnus={(alumnus: Alumnus) => this.deleteAlumnus(alumnus)}
                    show={this.state.showAlumnus}
                    closePopup={() => this.setState({ showAlumnus: false })}
                />
            </div>
        );
    }

    componentDidMount() {
        if (!this.fetchedAlumni) {
            this.fetchedAlumni = true;
            this.fetchAlumni();
        }
    }

    fetchAlumni() {
        fetch(this.generateBackendUrl('alumni'))
            .then(res => res.json())
            .then(alumni => this.setState({
                alumni: alumni.map((alumniRaw: any) => {
                    return {
                        id: alumniRaw.id,
                        fullName: alumniRaw.fullName,
                        currentEmployer: alumniRaw.currentEmployer,
                        previousEmployers: alumniRaw.previousEmployers,
                        studyStartDate: new Date(alumniRaw.studyStartDate),
                        studyEndDate: new Date(alumniRaw.studyEndDate),
                        description: alumniRaw.description
                    }
                })
            }));
    }

    async createAlumnus(alumnus: Alumnus) {
        await fetch(this.generateBackendUrl('alumni'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alumnus, dateReplacer)
        })
        this.fetchAlumni();
    }

    async updateAlumnus(alumnus: Alumnus) {
        await fetch(this.generateBackendUrl('alumni/'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alumnus, dateReplacer)
        });
        this.fetchAlumni();
    }

    async deleteAlumnus(alumnus: Alumnus) {
        await fetch(this.generateBackendUrl('alumni/' + alumnus.id), {
            method: 'DELETE'
        });
        this.fetchAlumni();
    }

    private generateBackendUrl(relative: string) {
        return window.location.origin.split(':').slice(0, 2).join(':') + ":8080/" + relative;
    }
}

interface AlumniEditPopupProps {
    alumnus: Alumnus | undefined;
    updateAlumnus: (alumnus: Alumnus) => Promise<void>;
    createAlumnus: (alumnus: Alumnus) => Promise<void>;
    deleteAlumnus: (alumnus: Alumnus) => Promise<void>;
    closePopup: () => void;
    show: boolean;
}

interface AlumniEditPopupState {
    alumnus: Alumnus | undefined;
    createMode: boolean;
}

// A popup, with input for each attribute of an alumnus. The alumnus will be passed as a prop.
export class AlumniEditPopup extends Component<AlumniEditPopupProps, AlumniEditPopupState> {
    constructor(props: any) {
        super(props);
        this.state = {
            alumnus: props.alumnus,
            createMode: props.alumnus === undefined
        };
    }

    componentDidUpdate(prevProps: Readonly<AlumniEditPopupProps>, prevState: Readonly<AlumniEditPopupState>, snapshot?: any): void {
        if (prevProps.alumnus !== this.props.alumnus) {
            this.setState({
                alumnus: this.props.alumnus,
                createMode: this.props.alumnus === undefined
            });
        }
    }

    render() {
        return (
            <Modal show={this.props.show} closeOnEsc={true} showClose={true} onClose={() => this.props.closePopup()}>
                <Modal.Card>
                    <Modal.Card.Body>
                        <form onSubmit={(event) => { event.preventDefault(); this.saveAlumnus(event); }} >
                            <Form.Field>
                                <Form.Label>
                                    ID (output):
                                    <Form.Input type="text" name="id" defaultValue={this.state.alumnus?.id} disabled />
                                </Form.Label>
                            </Form.Field>
                            <Form.Field>
                                <Form.Label>
                                    Full Name:
                                    <Form.Input type="text" name="fullName" defaultValue={this.state.alumnus?.fullName} required minLength={1} />
                                </Form.Label>
                            </Form.Field>
                            <Form.Field>
                                <Form.Label>
                                    Current Employer:
                                    <Form.Input type="text" name="currentEmployer" defaultValue={this.state.alumnus?.currentEmployer} />
                                </Form.Label>
                            </Form.Field>
                            <Form.Field>
                                <Form.Label>
                                    Previous Employers (split with semicolon):
                                    <Form.Input type="text" name="previousEmployers" defaultValue={this.state.alumnus?.previousEmployers?.join("; ")} />
                                </Form.Label>
                            </Form.Field>
                            <Form.Field>
                                <Form.Label>
                                    Study Start Date:
                                    <Form.Input type="date" name="studyStartDate" defaultValue={dateToString(this.state.alumnus?.studyStartDate)} required />
                                </Form.Label>
                            </Form.Field>
                            <Form.Field>
                                <Form.Label>
                                    Study End Date:
                                    <Form.Input type="date" name="studyEndDate" defaultValue={dateToString(this.state.alumnus?.studyEndDate)} required />
                                </Form.Label>
                            </Form.Field>
                            <Form.Field>
                                <Form.Label>
                                    Description:
                                    <Form.Input type="text" name="description" defaultValue={this.state.alumnus?.description} />
                                </Form.Label>
                            </Form.Field>
                            {this.state.createMode ? null : <Form.Input type="button" value="Remove" color="danger" onClick={() => this.deleteAlumnus()} />}
                            {this.state.createMode ? <Form.Input type="submit" value="Create" color="success" /> : <Form.Input type="submit" value="Update" color="success" />}
                        </form>
                    </Modal.Card.Body>
                </Modal.Card>
            </Modal>
        );
    }

    private deleteAlumnus() {
        this.props.deleteAlumnus(this.state.alumnus!);
        this.props.closePopup();
    }

    validate(event: any) {
        const form = event.target;
        if (form.studyStartDate.value
            && form.studyEndDate.value
            && form.studyStartDate.value > form.studyEndDate.value) {
            form.studyEndDate.setCustomValidity("Study end date must be after study start date");
            form.studyEndDate.reportValidity();
            return false;
        } else {
            form.studyEndDate.setCustomValidity("");
            form.studyEndDate.reportValidity();
        }
        return true;
    }

    saveAlumnus(event: any) {
        if (!this.validate(event)) {
            return;
        }
        const alumnus: Alumnus = {
            id: event.target.id.value,
            fullName: event.target.fullName.value,
            currentEmployer: event.target.currentEmployer.value,
            previousEmployers: event.target.previousEmployers.value.split(';'),
            studyStartDate: new Date(event.target.studyStartDate.value),
            studyEndDate: new Date(event.target.studyEndDate.value),
            description: event.target.description.value
        };
        if (this.state.createMode) {
            this.props.createAlumnus(alumnus);
        } else {
            this.props.updateAlumnus(alumnus);
        }
        this.props.closePopup();
    }
}


function dateToString(date: Date | null | undefined): string | undefined {
    if (date === null || date === undefined) { return undefined; }
    return date.toISOString().split('T')[0];
}

function dateReplacer(this: any, key: string, value: any): any {
    if (this[key] instanceof Date) {
        return dateToString(this[key]);
    }
    return value;
};