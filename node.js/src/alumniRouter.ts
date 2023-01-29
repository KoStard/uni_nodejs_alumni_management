import express, { NextFunction, Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { check, validationResult } from 'express-validator';
import { AlumniAccessor } from './accessors/alumniAccessor';
import { Alumnus } from './accessors/alumnus';


export class AlumniRouter {
    public router: Router;
    private alumniAccessor: AlumniAccessor;
    public constructor(alumniAccessor: AlumniAccessor) {
        this.router = express.Router();
        this.alumniAccessor = alumniAccessor;
        this.router.get('/', asyncHandler(this.getAlumni));
        this.router.get('/:id', [check('id').isNumeric()], asyncHandler(this.getAlumnus));
        this.router.post('/', [
            check('fullName').isString().not().isEmpty(),
            check('currentEmployer').isString(),
            check('previousEmployers').isArray(),
            check('studyStartDate').isDate().not().isEmpty(),
            check('studyEndDate').isDate().not().isEmpty(),
            check('description').isString(),
        ], asyncHandler(this.addAlumnus));
        this.router.put('/', [
            check('id').isNumeric().not().isEmpty(),
            check('fullName').isString().not().isEmpty(),
            check('currentEmployer').isString(),
            check('previousEmployers').isArray(),
            check('studyStartDate').isDate().not().isEmpty(),
            check('studyEndDate').isDate().not().isEmpty(),
            check('description').isString(),
        ], asyncHandler(this.updateAlumnus));
        // If there are records with invalid IDs, we still allow it to be deleted
        this.router.delete('/:id', asyncHandler(this.deleteAlumnus));
    }

    getAlumni = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const alumni = await this.alumniAccessor.getAlumni();
        res.send(alumni);
    }

    getAlumnus = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const alumnus = this.alumniAccessor.getAlumnus(parseInt(req.params.id));
        res.send(alumnus);
    }

    addAlumnus = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await this.alumniAccessor.addAlumnus(this.rawToAlumnus(req.body));
        res.send({ok: true});
    }

    updateAlumnus = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await this.alumniAccessor.updateAlumnus(this.rawToAlumnus(req.body));
        res.send({ok: true});
    }

    deleteAlumnus = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await this.alumniAccessor.deleteAlumnus(req.params.id);
        res.send({ok: true});
    }

    rawToAlumnus(rawAlumnus: any): Alumnus {
        const alumnus: Alumnus = {
            id: parseInt(rawAlumnus.id),
            fullName: rawAlumnus.fullName,
            currentEmployer: rawAlumnus.currentEmployer,
            previousEmployers: rawAlumnus.previousEmployers.map((employer: string) => employer.trim()),
            studyStartDate: new Date(rawAlumnus.studyStartDate),
            studyEndDate: new Date(rawAlumnus.studyEndDate),
            description: rawAlumnus.description,
        };
        if (alumnus.studyStartDate > alumnus.studyEndDate) {
            throw new Error('Study start date cannot be after study end date');
        }
        return alumnus;
    }
}

