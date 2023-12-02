import { Router } from 'express';
import { AddSubActivity, AsociateActivitiesToOt, AsociateActivityToOt, CheckActivity, createActivity, deleteActivity, deleteActivityByOt, getActivities, getActivitiesById, getActivitiesByOt, updateActivity, updateSubActivities, updateSubActivity } from '../../controllers/admin/activities.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const adminActivitiesRouter = Router();

adminActivitiesRouter.get('/get-activities', verifyAdmin, getActivities);
adminActivitiesRouter.get('/get-activities/:id', verifyAdmin, getActivitiesById);
adminActivitiesRouter.post('/create-activity', verifyAdmin, createActivity);
adminActivitiesRouter.put('/update-activity/:id', verifyAdmin, updateActivity);
adminActivitiesRouter.delete('/delete-activity/:id', verifyAdmin, deleteActivity);
adminActivitiesRouter.post('/add-subactivity/:id', verifyAdmin, AddSubActivity);
adminActivitiesRouter.put('/update-subactivities/:id', verifyAdmin, updateSubActivities);
adminActivitiesRouter.put('/update-subactivity/:id', verifyAdmin, updateSubActivity);
adminActivitiesRouter.post('/assign-activity', verifyAdmin, AsociateActivityToOt);
adminActivitiesRouter.post('/assign-activities', verifyAdmin, AsociateActivitiesToOt);
adminActivitiesRouter.get('/get-activities-ot/:otId', verifyAdmin, getActivitiesByOt);
adminActivitiesRouter.delete('/delete-subactivity/:id', verifyAdmin, deleteActivityByOt);
adminActivitiesRouter.post('/check-subactivity', verifyAdmin, CheckActivity);

export default adminActivitiesRouter;