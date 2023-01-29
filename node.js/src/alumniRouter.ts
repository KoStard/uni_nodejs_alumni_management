import express, { NextFunction, Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import { AlumniAccessor } from './accessors/alumniAccessor';
import { Alumnus } from './accessors/alumnus';


export class AlumniRouter {
    public router: Router;
    private alumniAccessor: AlumniAccessor;
    public constructor(alumniAccessor: AlumniAccessor) {
        this.router = express.Router();
        this.alumniAccessor = alumniAccessor;
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => this.getAlumni(req, res, next));
        this.router.get('/:id', [check('id').isNumeric()], (req: Request, res: Response, next: NextFunction) => this.getAlumnus(req, res, next));
        this.router.post('/', [
            check('fullName').isString().not().isEmpty(),
            check('currentEmployer').isString(),
            check('previousEmployers').isArray(),
            check('studyStartDate').isDate().not().isEmpty(),
            check('studyEndDate').isDate().not().isEmpty(),
            check('description').isString(),
        ], (req: Request, res: Response, next: NextFunction) => this.addAlumnus(req, res, next));
        this.router.put('/', [
            check('id').isNumeric().not().isEmpty(),
            check('fullName').isString().not().isEmpty(),
            check('currentEmployer').isString(),
            check('previousEmployers').isArray(),
            check('studyStartDate').isDate().not().isEmpty(),
            check('studyEndDate').isDate().not().isEmpty(),
            check('description').isString(),
        ], (req: Request, res: Response, next: NextFunction) => this.updateAlumnus(req, res, next));
        // If there are records with invalid IDs, we still allow it to be deleted
        this.router.delete('/:id', (req: Request, res: Response, next: NextFunction) => this.deleteAlumnus(req, res, next));
    }

    getAlumni(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        this.alumniAccessor.getAlumni().then((alumni) => {
            res.send(alumni);
        });
    }

    getAlumnus(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        this.alumniAccessor.getAlumnus(parseInt(req.params.id)).then((alumnus) => {
            res.send(alumnus);
        });
    }

    async addAlumnus(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await this.alumniAccessor.addAlumnus(this.rawToAlumnus(req.body));
        res.send({ok: true});
    }

    async updateAlumnus(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await this.alumniAccessor.updateAlumnus(this.rawToAlumnus(req.body));
        res.send({ok: true});
    }

    async deleteAlumnus(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await this.alumniAccessor.deleteAlumnus(req.params.id);
        res.send({ok: true});
    }

    rawToAlumnus(rawAlumnus: any): Alumnus {
        return {
            id: parseInt(rawAlumnus.id),
            fullName: rawAlumnus.fullName,
            currentEmployer: rawAlumnus.currentEmployer,
            previousEmployers: rawAlumnus.previousEmployers.map((employer: string) => employer.trim()),
            studyStartDate: new Date(rawAlumnus.studyStartDate),
            studyEndDate: new Date(rawAlumnus.studyEndDate),
            description: rawAlumnus.description,
        };
    }
}

